import { APIError, Asset, LinkSession, TransactResult } from 'anchor-link'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useAnchor } from './anchor'

export interface Profile {
  avatar?: string
  alias?: string
}

const baseProfile : Profile = {
  avatar: '',
  alias: '',
}

export interface Nice1 {
  balance: Asset
  profile: Profile
  updateProfile: (profile : Profile) => Promise<TransactResult>
  setAlias: (alias : string) => Promise<TransactResult>
  setAvatar: (avatar : string) => Promise<TransactResult>
}

export const Nice1Context = createContext<Nice1>({
  balance: Asset.fromString('0 NICEONE'),
  profile: baseProfile,
  updateProfile: () => Promise.resolve({} as TransactResult),
  setAlias: () => Promise.resolve({} as TransactResult),
  setAvatar: () => Promise.resolve({} as TransactResult),
})

export const useNice1 = () => {
  const cntxt = useContext(Nice1Context)

  if (cntxt === null) {
    throw new Error('useNice1() can only be used on children of <Nice1Provider />')
  }

  return cntxt
}

const cleanProfile = (profile: Profile) => {
  if (!profile.alias) {
    profile.alias = ''
  }
  if (!profile.avatar) {
    profile.avatar = ''
  }

  return profile
}

const zeroBalance = Asset.fromString('0 NICEONE')

export const Nice1Provider = ({children} : {children: ReactNode}) => {
  const [ balance, setBalance ] = useState<Asset>(zeroBalance)
  const [ profile, setProfile ] = useState<Profile>(baseProfile)
  const { session } = useAnchor()
  const [ balanceInit, setBalanceInit ] = useState<boolean>(false)
  const [ profileInit, setProfileInit ] = useState<boolean>(false)

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
      balance = zeroBalance
    }

    return balance
  }

  const updateProfile = async (profile : Profile) => {
    if (session === null) {
      throw new Error('Session not properly initialized')
    }

    const action = {
      account: 'n1ceprofiles',
      name: 'update',
      authorization: [session.auth],
      data: {
        user: session.auth.actor,
        ...cleanProfile(profile),
      } as any,
    }

    return session.transact({action}).then((result) => {
      setProfile(profile)

      return result
    })
  }

  const setAlias = async (alias: string) => {
    return updateProfile({alias})
  }

  const setAvatar = async (avatar: string) => {
    return updateProfile({avatar})
  }

  // get nice1 balance
  useEffect(() => {
    ;(async () => {
      if (balanceInit || session === null) return

      const bal = await getNiceBalance(session)

      setBalance(bal)
      setBalanceInit(true)
    })()

  }, [session, balanceInit])

  // get profile
  useEffect(() => {
    ;(async () => {
      if (session === null || profileInit) {
        return
      }

      const {rows} = await session.client.v1.chain.get_table_rows({
        json: true,
        code: 'n1ceprofiles',
        scope: '0',
        lower_bound: session.auth.actor,
        upper_bound: session.auth.actor,
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
      setProfileInit(true)
    })()

  }, [session])

  // logout
  useEffect(() => {
    if (profileInit && balanceInit && session === null) {
      setProfile(baseProfile)
      setBalance(zeroBalance)
      setProfileInit(false)
      setBalanceInit(false)
    }
  }, [session, profileInit])

  return (
    <Nice1Context.Provider value={{balance, profile, updateProfile, setAlias, setAvatar}}>
      {children}
    </Nice1Context.Provider>
  )
}
