import { API, APIClient, APIError } from '@greymass/eosio'
import AnchorLink, { ChainId, LinkSession } from 'anchor-link'
import AnchorLinkBrowserTransport from 'anchor-link-browser-transport'
import { IdentityProof } from 'eosio-signing-request'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

import blockchains from '../blockchains.json'

export interface Anchor {
  account: API.v1.AccountObject | null
  link: AnchorLink | undefined
  login: () => any
  logout: () =>  any
  session: LinkSession | null
}

export const AnchorContext = createContext<Anchor>({
  account: null,
  link: undefined,
  login: () => {},
  logout: () => {},
  session: null,
})

export const useAnchor = () => {
  const cntxt = useContext(AnchorContext)

  if (cntxt === null) {
    throw new Error('useAnchor() can only be used on children of <AnchorProvider />')
  }

  return cntxt
}

export const AnchorProvider = ({children, sessionKey} : {children: ReactNode, sessionKey: string}) => {
  const [link, setLink] = useState<AnchorLink | undefined>()
  const [session, setSession] = useState<LinkSession | null>(null)
  const [account, setAccount] = useState<API.v1.AccountObject | null>(null)

  useEffect(() => {
    ;(async () => {
      if (link || session) {
        return
      }

      const lnk = new AnchorLink({
        chains: blockchains.map(b => ({
          chainId: b.chainId,
          nodeUrl: new APIClient({
            url: `${b.rpcEndpoints[0].protocol}://${b.rpcEndpoints[0].host}:${b.rpcEndpoints[0].port}`,
          }),
        })),
        transport: new AnchorLinkBrowserTransport({
          disableGreymassFuel: true,
        }),
      })

      setLink(lnk)
      const sess = await lnk.restoreSession(sessionKey)

      if (sess && !account) {
        setAccount(await getAccount(sess))
      }
      setSession(sess)
    })()
  }, [
    link, session, sessionKey
  ])

  const getAccount = async (session: LinkSession) : Promise<API.v1.AccountObject> => {
    let account
    try {
      account = await session.client.v1.chain.get_account(session.auth.actor)
    } catch (error) {
      if (error instanceof APIError && error.code === 0) {
        throw new Error('No such account')
      } else {
        throw error
      }
    }

    return account
  }

  const login = async () => {
    if (!link) {
      throw new Error('Anchor link not initialized')
    }
    const identity = await link.login(sessionKey)
    const chains = blockchains.map((chain) => chain.chainId)
    const proof = IdentityProof.from(identity.proof)

    const chain = chains.find(id => ChainId.from(id).equals(proof.chainId))
    if (!chain) {
      throw new Error('Unsupported chain supplied in identity proof')
    }

    const account = await getAccount(identity.session)

    const auth = account.getPermission(proof.signer.permission).required_auth
    const valid = proof.verify(auth, account.head_block_time)

    if (!valid) {
      throw new Error('Proof invalid or expired')
    }

    setAccount(account)
    setSession(identity.session)
  }

  const logout = async () => {
    if (!link) {
      throw new Error('Anchor link not initialized')
    }
    await link.clearSessions(sessionKey)

    setAccount(null)
    setSession(null)
  }

  return (
    <AnchorContext.Provider value={{account, link, login, logout, session}}>
      {children}
    </AnchorContext.Provider>
  )
}
