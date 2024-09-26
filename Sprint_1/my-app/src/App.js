import Admin from "./Admin"
import VerticalNavbar from "./component/navbar";
import Body from "./component/body";
import Header from "./component/header";

function App() {
  /*return (

    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          <admin>

          </admin>
          Learn React
        </a>
      </header>
    </div>
  );
  */
  return (
    <>
      <Header/>
      <VerticalNavbar/>
      <Body/>
    </>
  )
}


export default App;
