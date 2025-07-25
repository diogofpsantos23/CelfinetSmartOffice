import { useState, useContext, useEffect} from "react";
import styled from "@emotion/styled";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Grid, Box } from "@mui/material";
import Divider from "@mui/material/Divider";

import { buildColumns } from "./KanbanData";
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
import { getKanban, addKanban, modifyKanban, deleteKanbanCard } from "../lib/kanban";

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
    const [columnsData, setcolumnsData] = useState([]);
    const [columns, setColumns] = useState(buildColumns(columnsData));
    const [openModal, setOpenModal] = useState(false);
    const [newCardStatus, setNewCardStatus] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null)
    const [formData, setFormData] = useState({ title: '', description: '' });
    
    const { user } = useContext(AuthContext);   
    
    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        setColumns(buildColumns(columnsData));
    }, [columnsData]);

    async function load() {
        const data = await getKanban();
        setcolumnsData(data);
    }

    const onDragEnd = (result) => {
        try {
            if (!result.destination) return;

            const { source, destination } = result;
            const newColumnsData = [...columnsData];
            let draggedItem

            if (source.droppableId !== destination.droppableId) {
                const destColumnId = destination.droppableId;
                draggedItem = newColumnsData.find(item => item.id === result.draggableId);

                if (draggedItem) {
                    draggedItem.status = destColumnId;
                }
                setColumns(buildColumns(newColumnsData));
                handleUpdateCard(draggedItem)
            } else {
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
        } catch (error) {
            console.error("Error during drag and drop:", error);
        }
    };

    const handleAddCard = async (status, title, description) => {
        const newItem = {
            id: uuidv4(),
            user: user?.username,
            title,
            description,
            status,
        };

        try {
            const res = await addKanban(newItem)

            if (res.success) {
                const card = res.kanban
                const updatedColumnsData = [...columnsData, card];
                setcolumnsData(updatedColumnsData);
                setColumns(buildColumns(updatedColumnsData));
            }

        }
        catch (err) {
            console.error("Error adding new kanban card: ",err)
        }

    };

    const handleCardClick = (item) => {
        setSelectedCard(item); 
        setFormData({
            title: item.title,
            description: item.description
        });
        setOpenModal(true); 

    };

    const handleUpdateCard = async (updatedCard) => {
        try {
            const res = await modifyKanban(updatedCard);
            if (res.success) {
                const updatedColumnsData = columnsData.map(card =>
                    card.id === updatedCard.id ? updatedCard : card
                );
                setcolumnsData(updatedColumnsData);
                setColumns(buildColumns(updatedColumnsData));
            }
        } catch (err) {
            console.error("Error while updating card. ", err);
        }
    }

    const handleDeleteCard = async () => {
        try {
            const res = await deleteKanbanCard(selectedCard.id);
                if (res.success) {
                    const updated = columnsData.filter(card => card.id !== selectedCard.id);
                    setcolumnsData(updated);
                    setColumns(buildColumns(updated));
                }
        } catch (err) {
            console.error("Error deleting card: ", err);
        }
        finally {
            handleCloseModal()
            window.location.reload()
        }
    };

    const handleOpenAddCardModal = (columnId) => {
        setNewCardStatus(columnId);
        setSelectedCard(null); 
        setFormData({ title: '', description: '' });
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedCard(null);
        setFormData({ title: '', description: '' }); 
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
                                            onClick={() => handleOpenAddCardModal(columnId)}
                                            >
                                            Add Card
                                        </button>
                                    </Grid>
                                </Grid>
                            </Box>
                            <Divider />

                            {columnData.items.map((item, idx) => (
                                <div key={item.id} onClick={()=>handleCardClick(item)}>
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
        <Dialog onClose={() => handleCloseModal()} open={openModal} fullWidth maxWidth="sm">
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
                {selectedCard && (
                    <Button
                        color="error"
                        onClick={() => {
                            handleDeleteCard()
                        }}
                    >
                        Delete
                    </Button>
                    )}
                <Button onClick={() => handleCloseModal()}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={async () => {
                        if (selectedCard) {
                            const hasChanged =
                                selectedCard.title !== formData.title ||
                                selectedCard.description !== formData.description;

                            if (hasChanged) {
                                const updatedCard = {
                                    ...selectedCard,
                                    title: formData.title,
                                    description: formData.description
                                };
                                handleUpdateCard(updatedCard)
                            }
                        } else {
                            await handleAddCard(newCardStatus, formData.title, formData.description);
                        }
                        handleCloseModal()
                    }}
                    disabled={!formData.title.trim()}
                >
                    {selectedCard ? "Save" : "Add"}
                </Button>
            </DialogActions>
            </Dialog>
        </>
    );
};

export default Kanban;