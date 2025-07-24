import { Card, CardHeader, Avatar } from "@mui/material";
import { Draggable } from "react-beautiful-dnd";

import cat from './../assets/cat.jpg'

const TaskCard = ({ item, index }) => {
    const getInitials = (name = "") =>
        name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase();

    return (
        <Draggable index={index} draggableId={item.id} type={item.status}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <Card sx={{ m: 1, boxShadow: 3 }}>
                        <CardHeader
                            avatar={
                                <Avatar sx={{ bgcolor: "#1976d2" }}>
                                    <img
                                        src={cat}
                                        alt="avatar"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            display: "block",
                                        }}
                                    />
                                </Avatar>
                            }
                            title={item.title}
                            subheader={item.description}
                        />
                    </Card>
                </div>
            )}
        </Draggable>
    );
};

export default TaskCard;
