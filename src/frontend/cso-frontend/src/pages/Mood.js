import Header from "../components/Header";
import Footer from "../components/Footer";
import "../App.css"
import MoodBoard from "../components/MoodBoard";

export default function Mood() {
    return (
        <div className="app">
            <Header/>
            <div aria-hidden="true" style={{height: '60px', width: '100%'}}/>
            <main style={{flex: 1}} className={"mood-container"}>
                <MoodBoard/>
            </main>
            <Footer/>
        </div>
    );
}
