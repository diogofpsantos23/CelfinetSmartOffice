import './MoodBoard.css'
import { getMoods, addMood, modifyMood, deleteMood , getMoodBoard} from '../lib/mood';
import ReactApexChart from 'react-apexcharts';  
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/*

now for my users i want them to have an array of moods where each one is like this
 {
  "id": "a1f2c3d4e5",  // or ObjectId-like string
  "mood": {
    "class_id": "positive",
    "emoji_id": "sunny"
  },
  "moodTopics": ["workload", "collaboration"],
  "note": "Got good sleep and cleared my inbox early.",
  "timestamp": { "$date": "2025-07-31T10:00:00Z" }
}

Dashboard (Admin):

Use Recharts, Chart.js, or D3.js to show:

Mood over time

Moods by team

Correlation with events (vacation, workload)


✅ Work-Appropriate Mood Topics
You could structure the input like:

"How are you feeling today?"
→ Pick an emoji 😐
→ Select 1 or more topics to describe why
→ Optionally write a short note

Here are curated topics tailored for a work setting:

🧠 Work-Related Mood Topics (Grouped)
🔄 Team & Collaboration
Relationships with colleagues

Communication quality

Support from team

Team spirit

📈 Workload & Tasks
Current workload

Task clarity

Progress toward goals

Time pressure / deadlines

💼 Role & Career
Motivation

Skill use

Growth opportunities

Job satisfaction

🛠️ Work Environment
Office/remote setup

Distractions / focus

Tools & resources

Company culture

❤️ Wellbeing & Balance
Stress level

Energy today

Work-life balance

Sleep/restedness

 */

export default function MoodBoard() {

    const [moodCategories, setMoodCategories] = useState([]);
    const { user } = useContext(AuthContext);
    const [topEmojis, setTopEmojis] = useState([]);
    const [moodCount, setMoodCount] = useState(0)
    const [state, setState] = useState({
          
            series: [],
            options: {
              chart: {
                type: 'donut',
              },
              plotOptions: {
                pie: {
                  startAngle: -90,
                  endAngle: 90,
                  offsetY: 10
                }
              },
              grid: {
                padding: {
                  bottom: -100
                }
              },
              responsive: [{
                breakpoint: 480,
                options: {
                  chart: {
                    width: 200
                  },
                  legend: {
                    position: 'bottom'
                  }
                }
              }]
            },
          
          
        });

    const getUserName = () => {
        if (!user || !user.username) return "";
        const [first, last] = user.username.split(".");
        const capitalize = (str) =>
            str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
        const firstName = capitalize(first);
        return `${firstName}`;
    };

    const parseMoodsToChartData = (moods) => {
        const emojiCountMap = new Map();
        const labelMap = new Map();      

        moods.forEach(({ mood }) => {
            const emoji_id = mood.emoji_id;

            if (!emojiCountMap.has(emoji_id)) {
                emojiCountMap.set(emoji_id, 1);
                labelMap.set(emoji_id, `${emoji_id}`);
            } else {
                emojiCountMap.set(emoji_id, emojiCountMap.get(emoji_id) + 1);
            }
        });

        const series = Array.from(emojiCountMap.values());
        const labels = Array.from(emojiCountMap.keys()).map(id => labelMap.get(id));

        return { series, labels };
    }

    const extractTopEmojis = (moods, top = 5) => {
        const emojiMap = new Map(); // key: emoji_id, value: { count, class }

        moods.forEach(({ mood }) => {
            const { emoji_id, class_id } = mood;

            if (!emojiMap.has(emoji_id)) {
                emojiMap.set(emoji_id, { count: 1, class_id });
            } else {
                emojiMap.get(emoji_id).count += 1;
            }
        });

        const sorted = [...emojiMap.entries()]
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, top)
            .map(([emoji_id, { count, class_id }]) => {
            return {
                emoji_id,
                count,
                class_id,
                emoji: getEmojiFromId(moods, emoji_id), 
            };
            });

        return sorted;
        }

        function getEmojiFromId(moods, id) {
            const match = moods.find(mood => mood.mood.emoji_id === id);
            return match ? match.mood.emoji : "❓";
        }


    const fetchMoods = async () => {
        try {
            const res = await getMoods();
            if (res) {
                //console.log(res)
                const { moods } = res;
                const top = extractTopEmojis(moods);
                setTopEmojis(top);
                const { series, labels } = parseMoodsToChartData(moods);
                setMoodCount(moods.length);
                
                setState(prev => ({
                    ...prev,
                    series,
                    options: {
                    ...prev.options,
                        labels,
                        legend: { show: false },
                        tooltip: {
                            y: {
                            formatter: (value) => {
                                return `${value}`;
                            }
                            }
                        }
                    }
                }));

            }
        } catch (err) {
            console.error("Error fetching moods:", err);
        }
    };

    const fetchMoodBoard = async () => {
        try{
            const res = await getMoodBoard()

            if (res) {
                //console.log(res)
                const categories = res.mood_categories.map(cat => ({
                    id: cat._id,
                    label: cat.label,
                    defaultEmoji: cat.emojis.length ? cat.emojis[0].emoji : "❓",
                    emojis: cat.emojis
                }));
                setMoodCategories(categories);
            }
        }
        catch (err) {
            console.error("error: ", err)
        }
    }

    useEffect(() => {
        fetchMoods();
        fetchMoodBoard();
    }, []);


    const MoodSelector = () => {
        const [openCategory, setOpenCategory] = useState(null);

        return (
            <section className="mood-panel-today">

            <div className="mood-category-boxes">
                {moodCategories.map(({ id, label, defaultEmoji }) => (
                <div
                    key={id}
                    className="mood-box"
                    onClick={() => setOpenCategory(id)}
                    title={label}
                >
                    {defaultEmoji}
                    <div style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>{label}</div>
                </div>
                ))}
            </div>

            {/* Modal */}
            {openCategory && (
                <div
                className="modal-backdrop"
                style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
                onClick={() => setOpenCategory(null)}
                >
                <div
                    className="modal-content"
                    style={{ backgroundColor: "white", padding: "2rem", borderRadius: "10px", maxWidth: "400px" }}
                    onClick={(e) => e.stopPropagation()} 
                >
                    <h3>{moodCategories.find((cat) => cat.id === openCategory).label}</h3>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                    {moodCategories
                        .find((cat) => cat.id === openCategory)
                        .emojis.map(({ id, emoji, label, meaning }) => (
                        <li key={id} style={{ margin: "1rem 0", display: "flex", alignItems: "center", gap: "1rem" }}>
                            <span style={{ fontSize: "2rem" }}>{emoji}</span>
                            <div>
                            <strong>{label}</strong>
                            <p style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>{meaning}</p>
                            </div>
                        </li>
                        ))}
                    </ul>
                    <button onClick={() => setOpenCategory(null)} style={{ marginTop: "1rem" }}>
                    Fechar
                    </button>
                </div>
                </div>
            )}
            </section>
        );
    }

    

    return (
        <div className="mood-panel">
            <section className='mood-panel-today'>
                <h4>Olá, {getUserName()}, como te sentes hoje?</h4>
                <MoodSelector />
            </section>

            <section className='mood-panel-overview'>
                <div className='mood-panel-calendar-donut'>
                    <div className='mood-calendar'>
                            {/* Mood Calendar */}
                    </div>
                    {/* Mood Counter */}
                    <div className='mood-counter'>
                        <h4>Mood counter</h4>
                        <section id="chart" className='mood-counter-donut'>
                            <ReactApexChart options={state.options} series={state.series} type="donut" width="100%" height={600} />
                        </section>
                        {/* <span className='mood-counter-donut-counter'>{moodCount}</span> */}
                        <section className='mood-counter-emojis'>
                            {topEmojis.map((emojiData, index) => (
                                <div key={index} className="emoji-stat">
                                <span className="emoji-symbol">{emojiData.emoji}</span>
                                <span className="emoji-text">{emojiData.emoji_id}</span>
                                <span className="emoji-count">x{emojiData.count}</span>
                                </div>
                            ))}
                        </section>
                    </div>
                </div>
                <div className='mood-day-day'>
                    {/* Mood day tracker */}
                </div>
            </section>
        </div>
    );
}
