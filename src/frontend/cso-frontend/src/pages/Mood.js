import Header from "../components/Header";
import Footer from "../components/Footer";
import '../components/MoodBoard.css'
import MoodBoard from "../components/MoodBoard";

export default function Mood() {
    return (
        <div className="mood-page">
            <Header/>
            <MoodBoard/>
            <Footer/>
        </div>
    );
}
