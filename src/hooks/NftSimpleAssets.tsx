import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useAnchor } from from './anchor'


export interface NftBaseSimpleAssets {
  id: number | null
  owner: string | null
  author: string | null
  category: string | null
  idata: string | null
  mdata: string | null}


export interface NftSimpleAssets {
  nftsSA: NftBaseSimpleAssets[]
  updateNfts: () => any
}


export const NftSimpleAssetsContext = createContext<NftSimpleAssets>({
  nftsSA: [],
  updateNfts: () => { },
})


export const useNftSimpleAssets = () => {
  const contxt = useContext(NftSimpleAssetsContext)
  if (contxt === null) {
    throw new Error('useNft() can only be used on children of <NftsProvider />')
  }
  return contxt
}


export const NftSimpleAssetsProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useAnchor()
  const [nftsSA, setNfts] = useState<NftBaseSimpleAssets[]>([])
  const [nftsInit, setNftsInit] = useState<boolean>(false)

  // Update NFTs after any actions
  const updateNfts = () => {
    setNftsInit(false)
  }


  // get NFTs SimpleAssets
  useEffect(() => {
    ; (async () => {
      if (nftsInit || session === null) {
        return
      }

      const { rows } = await session.client.v1.chain.get_table_rows({
        json: true,
        code: 'simpleassets',
        table: 'sassets',
        scope: session.auth.actor,
        //index_position: 'fifth',
        //lower_bound: 'name":"GRYON - LegendaryLegends',
        //upper_bound: '{"name":"GRYON - LegendaryLegends"}',
        //lower_bound: session.auth.actor,
        //upper_bound: session.auth.actor,
        limit: 1000,
        reverse: false,
        show_payer: false,
      })
      const nft_rows = rows

      if (!nft_rows) {
        return
      }

      setNfts(nft_rows)
      setNftsInit(true)

    })()
  }, [session, nftsInit]) //


  // logout
  useEffect(() => {
    if (nftsInit && session === null) {
      setNfts([])
      setNftsInit(false)

    }
  }, [session, nftsInit])




  return (
    <NftSimpleAssetsContext.Provider value={{ nftsSA, updateNfts }}>
      {children}
    </NftSimpleAssetsContext.Provider>
  )
}

