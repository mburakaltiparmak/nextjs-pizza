import { Progress } from "@/components/ui/progress";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Loading = () => {
  return (
    <div>
      <FontAwesomeIcon icon={faSpinner} />
    </div>
  );
};
export default Loading;
