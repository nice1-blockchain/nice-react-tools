import Decimal from 'decimal.js'
import { useAnchor } from '../hooks/anchor'

const Profile = () => {
  const { session, account } = useAnchor()

  const bal = account?.core_liquid_balance
  let balance : Decimal = new Decimal(0)
  if (bal) {
    balance = (new Decimal(bal.units.toString())).div(
      (new Decimal(Math.pow(10, bal.symbol.precision)))
    )
  }

  return (
    <>
      <p>Hey, how're you doing {String(session?.auth.actor)}</p>
      <p>Your current balance is {String(balance.toString())}</p>
    </>
  )
}

export default Profile
