import HeaderBox from "@/components/HeaderBox"
import RightSidebar from "@/components/RightSidebar"
import TotalBalanceBox from "@/components/TotalBalanceBox"

const Home = () => {
    const loggedIn = {firstName:"Ankit",lastName:"singh" , email:"ankit@gmail.com"}
  return (
   <span className="home">
    <div className="home-content">
        <header className="home-header">
            <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || 'Guest'}
            subtext="Aceess and manage your account and 
            transaction efficiency 
            "  />
          <TotalBalanceBox
          accounts={[]}
          totalBanks={1}
          totalCurrentBalance={42500.34}  />

        </header> 
        RECENT TRANSACTIONS
    </div>
    <RightSidebar
     user={loggedIn}
    transaction={[]}
    banks={[{currentBalance:2340},{currentBalance:5432}]}
    
    />
   </span>
  )
}

export default Home
