import React, { Dispatch, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EmptyGuidString } from "../helpers/ApplicationConstants";

const useQueryStringId = (required: boolean): [string | undefined, Dispatch<React.SetStateAction<string | undefined>>] => {
  const [searchParams] = useSearchParams();

  const [id, setId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (required) {
      if (searchParams.has("id")) {
        setId(searchParams.get("id") ?? EmptyGuidString);
      } else {
        setId(undefined);
        alert("No identifier was specified in the query string. Please, specify one as a value for the 'id' parameter.");
      }
    }
  }, [required, searchParams]);

  return [id, setId];
};

export default useQueryStringId;
