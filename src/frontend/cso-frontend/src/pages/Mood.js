import Header from "../components/Header";
import Footer from "../components/Footer";
import MoodBoard from "../components/MoodBoard";
import '../components/MoodBoard.css'

export default function Mood() {
    return (
        <div className="mood-page">
            <Header/>
            <MoodBoard/>
            <Footer/>
        </div>
    );
}
