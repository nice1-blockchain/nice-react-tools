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
