import { deleteEvent, updateEvent } from "../apis/EventApis"
import { getOneEvent } from "../apis/EventApis"
import Comments from "./Comments"
import CreateCommentForm from "./CreateCommentForm"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"


import { getPayloadFromToken, tokenExp, isOrganiser } from "../tokenLogic/tokenLogic"
import transformDate from '../transformDate'




export default function EventPage() {
  // State to store the information about the event. Will store an object after the page is loaded
  const [singleEvent, setSingleEvent] = useState({ attendees: [], date: "" })
  const [editedEvent, setEditedEvent] = useState(singleEvent)

  // This state is used as a switch for the create comment form
  const [showCommentForm, setShowCommentForm] = useState(true)

  // This state is used as a switch for the edit event form
  const [showEventForm, setShowEventForm] = useState(false)

  // Grab the event Id from the url and store it in the variable called id.
  const { id } = useParams()

  // Function that calls the fetch request get one event and then sets it in the singleEvent state
  const getEvent = () => {
    getOneEvent(id)
      .then((event) => event.json())
      .then((data => setSingleEvent(data.event)))
      .catch((error) => console.log(error.message))
  }

  // On page load the function that grabs the event information is called and fed the id of the event.
  useEffect(() => { getEvent(id) }, [])

  useEffect(() => {
    setEditedEvent({
      ...singleEvent,
      date: singleEvent.date.split("T")[0]
    })
  }, [singleEvent])

  const navigate = useNavigate()

  // Function to delete an event by its Id. It calls the destroy backend for that event.
  function deleteOneEvent() {
    deleteEvent(id)
      .then(() => navigate('/'))
      .catch((error) => console.log(error))
  }

  // Function to update one event. its fed the Id and the updated event information
  // changed so that it updates with any new info (even multiple at once )
  function updateOneEvent(id, editedEvent) {
    updateEvent(id, editedEvent)
      .then((event) => event.json())
      .then((data => setSingleEvent(data.event)))
      .catch((error) => console.log(error.message))
  }

  function addUserIdToAttendees() {
    const payloadFromToken = getPayloadFromToken()
    const userId = payloadFromToken.userId
    if (singleEvent.attendees.includes(userId)) {
      return
    } else {
      const attendees = [...singleEvent.attendees, userId]
      const eventData = { ...singleEvent, attendees: attendees }
      updateOneEvent(eventData._id, eventData)
    }
  }

  function handleInputOnChange(e) {
    setEditedEvent({ ...editedEvent, [e.target.name]: e.target.value })
  }

  function toggleForm() {
    setShowEventForm(!showEventForm)
  }

  return (
    <div className="event-page">
      <div className="event-container">
        {!showEventForm && <div className="event-content">
          {/* Checks to see if the fetch request is complete before showing the event information */}
          <p className="title">{singleEvent.title}</p>
          <p>Description: {singleEvent.description}</p>
          <p>Location: {singleEvent.location}</p>
          <p>Date: {transformDate(singleEvent.date)}</p>
          <p>Organiser: {singleEvent.organiser}</p>
          <p>People attending: {singleEvent.attendees.length} </p>
          {tokenExp() && <button id="attend-btn" onClick={addUserIdToAttendees}>Attend</button>}
        </div>}
        {showEventForm && <form className="edit-event-form" onSubmit={() => updateOneEvent(id, editedEvent)}>
          <div className="edit-event-form-input">
            <label>Title</label>
            <input
              name='title'
              onChange={handleInputOnChange}
              placeholder={singleEvent.title}
            />
          </div>
          <div className="where-and-when">
            <div className="edit-event-form-input">
              <label>Where</label>
              <input
                name='location'
                onChange={handleInputOnChange}
                placeholder={singleEvent.location}
              />
            </div>
            <div className="edit-event-form-input">
              <label>When</label>
              <input
                name='date'
                type="date"
                onChange={handleInputOnChange}
                min={new Date().toISOString().split("T")[0]}
                placeholder={singleEvent.date ? new Date(singleEvent.date).toLocaleDateString() : ''}
                value={editedEvent.date}
              />
            </div>
          </div>
          <div className="edit-event-form-input">
            <label>Description</label>
            <textarea
              name='description'
              onChange={handleInputOnChange}
              placeholder={singleEvent.description}
            />
          </div>
          <button className="normal-btn" type="submit">Save changes</button>
        </form>}
        <div className="event-btns">
          {tokenExp() && isOrganiser(singleEvent.organiser) && <button className="normal-btn" onClick={toggleForm}>Edit Event</button>}
          {tokenExp() && isOrganiser(singleEvent.organiser) && <button className="danger-btn" onClick={deleteOneEvent}>Delete Event</button>}
        </div>
      </div>

      <hr />
      <div className="comments-container">
        COMMENTS
        {/* If the showCommentForm is true to Comment form will appear and pass down the id of the event. */}
        {tokenExp() && <div className="create-comment-form">
          <CreateCommentForm
            setSingleEvent={setSingleEvent}
            setShowCommentForm={setShowCommentForm}
            id={id} />
        </div>}
        {/* This will be where the comments will be generated. The whole event information is passed down */}
        <Comments
          comments={singleEvent.comments}
          setSingleEvent={setSingleEvent}
          eventId={id}
        />
      </div>
    </div>
  )
}