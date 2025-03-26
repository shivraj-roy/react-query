import { useState } from "react";
import { Link, Outlet, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchEvent, deleteEvent } from "../../utils/http.js";
import { queryClient } from "../../utils/http.js";
import Header from "../Header.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
   const [isDeleting, setIsDeleting] = useState(false);
   const { id } = useParams();
   const navigate = useNavigate();
   const { data, isPending, isError, error } = useQuery({
      queryKey: ["events", id],
      queryFn: ({ signal }) => fetchEvent({ id, signal }),
      staleTime: 3000,
   });

   const deleteEventMutation = useMutation({
      mutationFn: deleteEvent,
      onSuccess: () => {
         queryClient.invalidateQueries({
            queryKey: ["events"],
            refetchType: "none", // This is to prevent the query from refetching the data when the mutation is successful...
         });
         navigate("../");
      },
   });

   const handleStartDelete = () => {
      setIsDeleting(true);
   };

   const handleStopDelete = () => {
      setIsDeleting(false);
   };

   return (
      <>
         {isDeleting && (
            <Modal onClose={handleStopDelete}>
               <p>Are you sure you want to delete this event?</p>
               <p>This action cannot be undone.</p>
               <div className="form-actions">
                  {deleteEventMutation.isPending && <p>Deleting...</p>}
                  {!deleteEventMutation.isPending && (
                     <>
                        <button
                           onClick={handleStopDelete}
                           className="button-text"
                        >
                           Cancel
                        </button>
                        <button
                           className="button"
                           onClick={() => deleteEventMutation.mutate({ id })}
                        >
                           Delete
                        </button>
                     </>
                  )}
               </div>
               {deleteEventMutation.isError && <p>Failed to delete event.</p>}
            </Modal>
         )}
         <Outlet />
         <Header>
            <Link to="/events" className="nav-item">
               View all Events
            </Link>
         </Header>
         <article id="event-details">
            {isPending && <LoadingIndicator />}
            {isError && (
               <ErrorBlock
                  title="An error occurred"
                  message={error.info?.message || "Failed to fetch event"}
               />
            )}
            {data && (
               <>
                  <header>
                     <h1>{data.title}</h1>
                     <nav>
                        <button
                           onClick={handleStartDelete}
                           disabled={
                              isDeleting || deleteEventMutation.isPending
                           }
                        >
                           {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                        <Link to="edit">Edit</Link>
                     </nav>
                  </header>
                  <div id="event-details-content">
                     <img
                        src={`http://localhost:3000/${data.image}`}
                        alt={data.title}
                     />
                     <div id="event-details-info">
                        <div>
                           <p id="event-details-location">{data.location}</p>
                           <time dateTime={`${data.date}T${data.time}`}>
                              {new Date(data.date).toLocaleDateString("en-US", {
                                 year: "numeric",
                                 month: "short",
                                 day: "numeric",
                              })}{" "}
                              @ {data.time}
                           </time>
                        </div>
                        <p id="event-details-description">{data.description}</p>
                     </div>
                  </div>
               </>
            )}
         </article>
      </>
   );
}
