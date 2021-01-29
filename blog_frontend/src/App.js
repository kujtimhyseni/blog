import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Blog project by Kujtim Hyseni and Kushtrim Pacaj
        </p>
        <body class="bg-light">
          <div class="container">
          <div id="root"></div>
          </div>
             <script src="home.js" type="text/babel"></script>
              <p>TEST</p>
          </body>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
