import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useAnchor } from './anchor'


export interface NftBaseAtomicMarket {
  sale_id: number //| null
  seller: string //| null
  asset_ids: number [] //| null
  offer_id: number //| null
  listing_price: number //| null
  settlement_symbol: string //| null
  collection_name: string //| null
  collection_fee: number //| null
  ramPayer: string //| null
}


export interface NftAtomicMarket {
  nftsAM: NftBaseAtomicMarket[]
  updateNftsAM: () => any
}


export const NftAtomicMarketContext = createContext<NftAtomicMarket>({
  nftsAM: [],
  updateNftsAM: () => { },
})


export const useNftAtomicMarket = () => {
  const contxt = useContext(NftAtomicMarketContext)
  if (contxt === null) {
    throw new Error('useNftAtomicMarket() can only be used on children of ...')
  }
  return contxt
}



export const NftAtomicMarketProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useAnchor()
  const [nftsAM, setNftsAM] = useState<NftBaseAtomicMarket[]>([])
  const [nftsAMInit, setNftsAMInit] = useState<boolean>(false)

  const updateNftsAM = () => {
    setNftsAMInit(false)
  }

  // get NFTs ATOMIC MARKETS
  useEffect(() => {
    ; (async () => {
      if (nftsAMInit || session === null) {
        return
      }

      const { rows } = await session.client.v1.chain.get_table_rows({
        json: true,
        code: 'atomicmarket',
        table: 'sales',
        scope: 'atomicmarket',
        limit: 1000,
        reverse: false,
        show_payer: false,
      })
      const nft_rows = rows

      if (!nft_rows) {
        return
      }

      setNftsAM(nft_rows)
      setNftsAMInit(true)

    })()
  }, [session, nftsAMInit]) //


  // logout
  useEffect(() => {
    if (nftsAMInit && session === null) {
      setNftsAM([])
      setNftsAMInit(false)

    }
  }, [session, nftsAMInit])



  return (

    <NftAtomicMarketContext.Provider value={{ nftsAM, updateNftsAM }}>
      {children}
    </NftAtomicMarketContext.Provider>
  )


}
