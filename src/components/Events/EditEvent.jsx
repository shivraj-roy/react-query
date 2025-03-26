import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEvent, updateEvent, queryClient } from "../../utils/http.js";
import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
   const navigate = useNavigate();
   const { id } = useParams();
   const { data, isPending, isError, error } = useQuery({
      queryKey: ["events", id],
      queryFn: ({ signal }) => fetchEvent({ id, signal }),
   });
   const { mutate } = useMutation({
      mutationFn: updateEvent,
      onMutate: async ({ event }) => {
         await queryClient.cancelQueries({ queryKey: ["events", id] });
         const previousEvent = queryClient.getQueryData(["events", id]);
         queryClient.setQueryData(["events", id], event);
         return { previousEvent };
      },
      onError: (error, variables, context) => {
         queryClient.setQueryData(["events", id], context.previousEvent);
      },
      onSettled: () => {
         queryClient.invalidateQueries({ queryKey: ["events", id] });
      },
   });
   function handleSubmit(formData) {
      mutate({ id, event: formData });
      navigate("../");
   }

   function handleClose() {
      navigate("../");
   }

   let content;

   if (isPending) {
      content = (
         <div className="center">
            <LoadingIndicator />
         </div>
      );
   }

   if (isError) {
      content = (
         <ErrorBlock
            title="An error occurred"
            message={error.info?.message || "Failed to fetch event"}
         >
            <div className="form-actions">
               <Link to="../" className="button">
                  Cancel
               </Link>
            </div>
         </ErrorBlock>
      );
   }

   if (data) {
      content = (
         <EventForm inputData={data} onSubmit={handleSubmit}>
            <Link to="../" className="button-text">
               Cancel
            </Link>
            <button type="submit" className="button">
               Update
            </button>
         </EventForm>
      );
   }

   return <Modal onClose={handleClose}>{content}</Modal>;
}
