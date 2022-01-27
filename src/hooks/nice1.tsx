import { APIError, Asset, LinkSession } from 'anchor-link'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useAnchor } from './anchor'

export interface Profile {
  avatar: string | null
  alias: string | null
}

export interface Nice1 {
  balance: Asset
  profile: Profile
}

export const Nice1Context = createContext<Nice1>({
  balance: Asset.fromString('0 NICEONE'),
  profile: {
    avatar: null,
    alias: null,
  },
})

export const useNice1 = () => {
  const cntxt = useContext(Nice1Context)

  if (cntxt === null) {
    throw new Error('useNice1() can only be used on children of <Nice1Provider />')
  }

  return cntxt
}

export const Nice1Provider = ({children} : {children: ReactNode}) => {
  const [ balance, setBalance ] = useState<Asset>(Asset.fromString('0 NICEONE'))
  const [ profile, setProfile ] = useState<Profile>({
    avatar: null,
    alias: null,
  })
  const { session } = useAnchor()
  const [ initBalance, setInitBalance ] = useState<boolean>(false)

  const getNiceBalance = async (session: LinkSession) : Promise<Asset> => {
    let balance : Asset
    try {
      ([balance] = await session.client.v1.chain.get_currency_balance('niceonetoken', session.auth.actor))
    } catch (error) {
      if (error instanceof APIError && error.code === 0) {
        throw new Error('Could not get nice1 balance')
      } else {
        throw error
      }
    }

    if (balance === undefined) {
      balance = Asset.fromString('0 NICEONE')
    }

    return balance
  }

  // get nice1 balance
  useEffect(() => {
    ;(async () => {
      if (initBalance || session === null) return

      const bal = await getNiceBalance(session)

      setBalance(bal)
      setInitBalance(true)
    })()

  }, [session, initBalance])

  // get profile
  useEffect(() => {
    ;(async () => {
      if (typeof profile.alias === 'string' || typeof profile.avatar === 'string' || session === null) return

      const {rows} = await session.client.v1.chain.get_table_rows({
        json: true,
        code: 'n1ceprofiles',
        scope: 'n1ceprofiles',
        lower_bound: session.auth.actor,
        table: 'profiles',
        limit: 1,
        reverse: false,
        show_payer: false,
      })

      const [prof] = rows

      if (!prof) {
        return
      }

      setProfile(prof)
    })()

  }, [session])

  return (
    <Nice1Context.Provider value={{balance, profile}}>
      {children}
    </Nice1Context.Provider>
  )
}