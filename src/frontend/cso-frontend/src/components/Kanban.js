import { useState, useContext} from "react";
import styled from "@emotion/styled";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Grid, Box } from "@mui/material";
import Divider from "@mui/material/Divider";

import { buildColumns, CandidatesData } from "./KanbanData";
import TaskCard from "./TaskCard";
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';
import { AuthContext } from "../context/AuthContext";


const Container = styled("div")(() => ({
  display: "flex",
  flexDirection: "row",
}));

const TaskList = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  background: "#ffffffff",
  minWidth: "341px",
  borderRadius: "5px",
  padding: "15px 15px",
  marginRight: "45px",
  maxWidth: '30vw',
}));

const TaskColumnStyles = styled("div")(() => ({
  margin: "8px",
  display: "flex",
  width: "100%",
  minHeight: "60vh",
}));
const Title = styled("span")(() => ({
  fontWeight: "bold",
  color: "#333333",
  fontSize: 16,
  paddingBottom: "1.5px",
}));
const FilterIcon = styled("span")(() => ({
  marginBottom: "1.5px",
  color: "text.secondary",
}));

const Kanban = () => {
    const [candidates, setCandidates] = useState(CandidatesData);
    const [columns, setColumns] = useState(buildColumns(CandidatesData));
    const [openModal, setOpenModal] = useState(false);
    const [newCardStatus, setNewCardStatus] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null)
    const [formData, setFormData] = useState({ title: '', description: '' });
    
    const { user } = useContext(AuthContext);   



  const onDragEnd = (result) => { // Removed columns and setColumns from arguments
    if (!result.destination) return;

    const { source, destination } = result;

    // Create a mutable copy of the candidates array to modify
    const newCandidates = [...candidates];

    if (source.droppableId !== destination.droppableId) {
        const destColumnId = destination.droppableId;

        // Find the dragged item in the newCandidates array and update its status
        const draggedItem = newCandidates.find(item => item.id === result.draggableId);
        if (draggedItem) {
            draggedItem.status = destColumnId;
        }

        setColumns(buildColumns(newCandidates));


    } else {
        // Moving within the same column (no status change needed)
        const columnId = source.droppableId;
        const columnItems = columns[columnId].items;
        const copiedItems = [...columnItems];
        const [removed] = copiedItems.splice(source.index, 1);
        copiedItems.splice(destination.index, 0, removed);

        setColumns({
            ...columns,
            [columnId]: {
                ...columns[columnId],
                items: copiedItems
            },
        });
    }
  };

    const handleAddCard = (status, title, description) => {
        const newItem = {
            id: uuidv4(),
            user: user?.username,
            title,
            description,
            status,
        };

        const updatedCandidates = [...candidates, newItem];
        setCandidates(updatedCandidates);
        setColumns(buildColumns(updatedCandidates));
    };

    const handleCardClick = (item) => {
        setSelectedCard(item); 
        setFormData({
            title: item.title,
            description: item.description
        });
        setOpenModal(true); 
    };

    return (
        <>
        <DragDropContext
            onDragEnd={onDragEnd} 
            >
            <Container>
                <TaskColumnStyles>
                {Object.entries(columns).map(([columnId, columnData], index) => (
                    <Droppable key={columnId} droppableId={columnId}>
                        {(provided, snapshot) => (
                        <TaskList
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{
                                background: snapshot.isDraggingOver ? "#d7deeaff" : "#ffffffc0",
                                boxShadow: snapshot.isDraggingOver
                                    ? "0 8px 24px rgba(0, 0, 0, 0.18)"
                                    : "0 6px 12px rgba(0, 0, 0, 0.08)",
                            }}
                        >
                            <Box sx={{ width: "100%", position: 'relative' }}>
                                <Grid
                                    container
                                    alignItems="center"
                                    justifyContent="space-between"
                                    paddingBottom="0.5rem"
                                    >
                                    <Grid item>
                                        <Title>{columnData.title}</Title>
                                    </Grid>
                                    <Grid item>
                                        <button
                                          className="kanban-add-btn"
                                            onClick={() => {
                                                setNewCardStatus(columnId);
                                                setOpenModal(true);
                                            }}
                                            >
                                            Add Card
                                        </button>
                                    </Grid>
                                </Grid>
                            </Box>
                            <Divider />

                            {columnData.items.map((item, idx) => (
                                <div onClick={()=>handleCardClick(item)}>
                                    <TaskCard key={item.id} item={item} index={idx} />
                                </div>
                            ))}
                            {provided.placeholder}
                        </TaskList>
                        )}
                    </Droppable>
                    ))}
                </TaskColumnStyles>
            </Container>
        </DragDropContext>
        <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
            <DialogTitle>Add New Card</DialogTitle>
            <DialogContent>
                <TextField
                    margin="dense"
                    label="Title"
                    fullWidth
                    variant="outlined"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                <TextField
                    margin="dense"
                    label="Description"
                    fullWidth
                    multiline
                    minRows={3}
                    variant="outlined"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        if (selectedCard) {
                            const updatedCandidates = candidates.map(card =>
                                card.id === selectedCard.id
                                    ? { ...card, title: formData.title, description: formData.description }
                                    : card
                            );
                            setCandidates(updatedCandidates);
                            setColumns(buildColumns(updatedCandidates))
                        } else {
                            handleAddCard(newCardStatus, formData.title, formData.description);
                        }
                        setFormData({ title: '', description: '' });
                        setSelectedCard(null);
                        setOpenModal(false);
                    }}
                    disabled={!formData.title.trim()}
                >
                Add
                </Button>
            </DialogActions>
            </Dialog>
        </>
    );
};

export default Kanban;