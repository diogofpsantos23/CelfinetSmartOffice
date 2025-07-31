import Header from "../components/Header";
import Footer from "../components/Footer";
import "../App.css"

export default function Analytics() {
    return (
        <div className="app">
            <Header/>
            <div aria-hidden="true" style={{height: '60px', width: '100%'}}/>
            <main style={{flex: 1}} className={"mood-container"}>
                <section className="mood-panel"
                         style={{padding: '16rem', textAlign: 'center', fontSize: '2rem', fontWeight: '500'}}>
                    Under Construction...
                </section>
            </main>
            <Footer/>
        </div>
    );
}
