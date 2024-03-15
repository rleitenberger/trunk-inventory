import { useContext } from "react";
import { OrganizationContext } from "./OrganizationProvider";

const useOrganization = () => useContext(OrganizationContext);

export default useOrganization;