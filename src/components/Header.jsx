import { useIsFetching } from "@tanstack/react-query";

export default function Header({ children }) {
   const isFetching = useIsFetching();
   return (
      <>
         {isFetching > 0 && (
            <div id="main-header-loading">
               <progress />
            </div>
         )}
         <header id="main-header">
            <div id="header-title">
               <h1>EventMania</h1>
            </div>
            <nav>{children}</nav>
         </header>
      </>
   );
}
