import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useAnchor } from './anchor'

export interface NftBaseSimpleMarket {
  id: number | null
  owner: string | null
  author: string | null
  category: string | null
  price: number | null
  offerprice: number | null
  offertime: number | null
  RamPayer: string | null
}


export interface NftSimpleMarket {
  nftsSM: NftBaseSimpleMarket[]
  updateNfts: () => any
}

export const NftSimpleMarketContext = createContext<NftSimpleMarket>({
  nftsSM: [],
  updateNfts: () => { },
})


export const useNftSimpleMarket = () => {
  const contxt = useContext(NftSimpleMarketContext)
  if (contxt === null) {
    throw new Error('useNftSimpleMarket() can only be used on children of ....')
  }
  return contxt

}


export const NftSimpleMarketProvider = ({ children }: { children: ReactNode }) => {
  const {session} = useAnchor()
  const [nftsSM, setNftsSM] = useState<NftBaseSimpleMarket[]>([])
  const [nftsSMInit, setNftsSMInit] = useState<boolean>(false)


  const updateNfts = () => {
    setNftsSMInit(false)
  }

  // get NFTs SIMPLE_MARKET
  useEffect(() => {
    ; (async () => {
      if (nftsSMInit || session === null) {
        return
      }

      const { rows } = await session.client.v1.chain.get_table_rows({
        json: true,
        code: 'simplemarket',
        table: 'sells',
        scope: 'simplemarket',
        limit: 1000,
        reverse: false,
        show_payer: false,
      })
      const nft_rows = rows

      if (!nft_rows) {
        return
      }

      setNftsSM(nft_rows)
      setNftsSMInit(true)

    })()
  }, [session, nftsSMInit]) //


  // logout
  useEffect(() => {
    if (nftsSMInit && session === null) {
      setNftsSM([])
      setNftsSMInit(false)

    }
  }, [session, nftsSMInit])



  return (
    <NftSimpleMarketContext.Provider value={{ nftsSM, updateNfts }}>
      {children}
    </NftSimpleMarketContext.Provider>
  )
}

