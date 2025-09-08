import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
 
 
export  function LoadingGear() {
  return (
    <div className="flex items-center gap-4 justify-center">
 
      <FontAwesomeIcon icon={faGear} spin size="1x" className="text-blue-500 text-2xl" />
 
 
 
 
      <span className=" font-medium animate-pulse text-2xl text-blue-500">Loading</span>
    </div>
  );
}