import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
    return (
        <div className="app">
            <Header />

            <main style={{ flex: 1 }} />

            <Footer />
        </div>
    );
}

export default App;
