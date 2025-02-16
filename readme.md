Nice1 react tools
=================

React helper tools for using both nice1 and anchor wallet in your applications.

Installation
------------

~~~bash
yarn add @nice1/react-tools
# or
npm i @nice1/react-tools
~~~

Hooks
-----

These hooks can help you in the different parts of your app:

### useAnchor

With `useAnchor` you can easily login, logout, make blockchain calls and whatnot, with your anchor wallet:

~~~tsx
import { useAnchor } from '@nice1/react-tools'

const MyCoolComponent = () => {
  const { login, logout, session } = useAnchor()

  if (!session) {
    return <button onClick={login}>Login</button>
  }

  return (
    <>
      <p>Hi {session?.auth.actor} :)</p>
      <p>You can <button onClick={logout}>logout</button> whenever you want.</p>
    </>
  )
}
~~~

### useNice1

After you logged in using `useAnchor`, you can access and update nice1 info like your balance or profile information from our contracts:

~~~tsx
import { useAnchor, useNice1 } from '@nice1/react-tools'

const MyCoolComponent = () => {
  const { login, logout, session } = useAnchor()
  const { profile, balance } = useNice1()

  if (!session) {
    return <button onClick={login}>Login</button>
  }

  return (
    <>
      <p>Hi {session?.auth.actor} :)</p>
      <p>Your balance is {balance} and your a.k.a. is {profile.alias}.</p>
      <p>You also have defined a profile image as {profile.avatar}</p>
      <p>You can <button onClick={logout}>logout</button> whenever you want.</p>
    </>
  )
}
~~~


---

## **NFT Staking & Market Tools**  

### **useNftAtomicAssets**  
This hook retrieves and manages NFTs stored in **AtomicAssets**.

```tsx
import { useNftAtomicAssets } from '@nice1/react-tools'

const MyComponent = () => {
  const { nftsAA, updateNftsAA } = useNftAtomicAssets()

  return (
    <>
      <h2>Your NFTs (AtomicAssets):</h2>
      <ul>
        {nftsAA.map((nft) => (
          <li key={nft.asset_id}>
            Collection: {nft.collection_name}, Template: {nft.template_id}
          </li>
        ))}
      </ul>
      <button onClick={updateNftsAA}>Refresh NFTs</button>
    </>
  )
}
```

### **useNftAtomicMarket**  
This hook retrieves **NFTs listed for sale** in **AtomicMarket**.

```tsx
import { useNftAtomicMarket } from '@nice1/react-tools'

const MyComponent = () => {
  const { nftsAM, updateNftsAM } = useNftAtomicMarket()

  return (
    <>
      <h2>NFTs on AtomicMarket:</h2>
      <ul>
        {nftsAM.map((sale) => (
          <li key={sale.sale_id}>
            Seller: {sale.seller}, Price: {sale.listing_price}
          </li>
        ))}
      </ul>
      <button onClick={updateNftsAM}>Refresh Market</button>
    </>
  )
}
```

### **useNftSimpleAssets**  
This hook retrieves and manages NFTs stored in **SimpleAssets**.

```tsx
import { useNftSimpleAssets } from '@nice1/react-tools'

const MyComponent = () => {
  const { nftsSA, updateNfts } = useNftSimpleAssets()

  return (
    <>
      <h2>Your NFTs (SimpleAssets):</h2>
      <ul>
        {nftsSA.map((nft) => (
          <li key={nft.id}>
            Owner: {nft.owner}, Category: {nft.category}
          </li>
        ))}
      </ul>
      <button onClick={updateNfts}>Refresh NFTs</button>
    </>
  )
}
```

### **useNftSimpleMarket**  
This hook retrieves **NFTs listed for sale** in **SimpleMarket**.

```tsx
import { useNftSimpleMarket } from '@nice1/react-tools'

const MyComponent = () => {
  const { nftsSM, updateNfts } = useNftSimpleMarket()

  return (
    <>
      <h2>NFTs on SimpleMarket:</h2>
      <ul>
        {nftsSM.map((sale) => (
          <li key={sale.id}>
            Seller: {sale.owner}, Price: {sale.price}
          </li>
        ))}
      </ul>
      <button onClick={updateNfts}>Refresh Market</button>
    </>
  )
}
```

---

## **License**  
This project is licensed under **Apache 2.0**.  

---
