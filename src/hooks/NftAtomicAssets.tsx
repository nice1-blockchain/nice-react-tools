import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useAnchor } from './anchor'


export interface NftBaseAtomicAssets {
  asset_id: number //| null
  collection_name: string //| null
  schema_name: string //| null
  template_id: number //| null
  immutable_serialized_data: number[]
  mutable_serialized_data: [] //| null
  //ramPayer: string //| null
}


export interface NftAtomicAssets {
  nftsAA: NftBaseAtomicAssets[]
  updateNftsAA: () => any
}


export const NftAtomicAssetsContext = createContext<NftAtomicAssets>({
  nftsAA: [],
  updateNftsAA: () => { },
})


export const useNftAtomicAssets = () => {
  const contxt = useContext(NftAtomicAssetsContext)
  if (contxt === null) {
    throw new Error('useNftAtomicAssets() can only be used on children of ...')
  }
  return contxt
}



export const NftAtomicAssetsProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useAnchor()
  const [nftsAA, setNftsAA] = useState<NftBaseAtomicAssets[]>([])
  const [nftsAAInit, setNftsAAInit] = useState<boolean>(false)

  const updateNftsAA = () => {
    setNftsAAInit(false)
  }

  // get NFTs ATOMIC ASSETS
  useEffect(() => {
    ; (async () => {
      if (nftsAAInit || session === null) {
        return
      }

      const { rows } = await session.client.v1.chain.get_table_rows({
        json: true,
        code: 'atomicassets',
        table: 'assets',
        scope: session.auth.actor, 
        limit: 1000,
        reverse: false,
        show_payer: false,
      })
      const nft_rows = rows

      if (!nft_rows) {
        return
      }

      setNftsAA(nft_rows)
      setNftsAAInit(true)

    })()
  }, [session, nftsAAInit]) //


  // logout
  useEffect(() => {
    if (nftsAAInit && session === null) {
      setNftsAA([])
      setNftsAAInit(false)

    }
  }, [session, nftsAAInit])



  return (
    <NftAtomicAssetsContext.Provider value={{ nftsAA, updateNftsAA }}>
      {children}
    </NftAtomicAssetsContext.Provider>
  )


}

