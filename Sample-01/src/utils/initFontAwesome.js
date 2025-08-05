import { library } from "@fortawesome/fontawesome-svg-core";
import { 
  faLink, 
  faPowerOff, 
  faUser, 
  faCheckCircle, 
  faSignInAlt 
} from "@fortawesome/free-solid-svg-icons";

function initFontAwesome() {
  library.add(faLink);
  library.add(faUser);
  library.add(faPowerOff);
  library.add(faCheckCircle);
  library.add(faSignInAlt);
}

export default initFontAwesome;
