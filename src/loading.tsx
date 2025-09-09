import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export function LoadingGear() {
  return (
    <div className="flex items-center gap-4 justify-center">
     
      <FontAwesomeIcon 
        icon={faSpinner} 
        spinPulse 
        size="2x" 
        className="text-white text-6xl" 
      />

      <span className="font-medium animate-pulse text-5xl text-white">
        Loading
      </span>
    </div>
  );
}
