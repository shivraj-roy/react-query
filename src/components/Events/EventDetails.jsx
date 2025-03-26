import { Link, Outlet, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchEvent } from "../../utils/http.js";
import Header from "../Header.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EventDetails() {
   const { id } = useParams();
   const { data, isPending, isError, error } = useQuery({
      queryKey: ["events", id],
      queryFn: () => fetchEvent({ id }),
      staleTime: 3000,
   });

   return (
      <>
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
                        <button>Delete</button>
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
                              {data.date} @ {data.time}
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
