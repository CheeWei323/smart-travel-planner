import { useEffect, useRef, useState } from "react";
import { errorMessage } from "../services/api";

export default function useResource(load, initial = []) {
  const initialValue = useRef(initial);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({
    data: initial,
    error: "",
    load: null,
    revision: -1,
  });
  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(load)
      .then((data) => {
        if (active) setState({ data, error: "", load, revision });
      })
      .catch((error) => {
        if (active)
          setState({
            data: initialValue.current,
            error: errorMessage(error),
            load,
            revision,
          });
      });
    return () => {
      active = false;
    };
  }, [load, revision]);
  return {
    data: state.data,
    error: state.error,
    loading: state.load !== load || state.revision !== revision,
    reload: () => setRevision((value) => value + 1),
    setData: (value) =>
      setState((previous) => ({
        ...previous,
        data: typeof value === "function" ? value(previous.data) : value,
      })),
  };
}
