import { useEffect, useState } from "react";

function EditableTitle({ title }) {
  const [value, setValue] = useState(title);

  useEffect(() => {
    setValue(title);
  }, [title, value]);

  return <input value={value} onChange={e => setValue(e.target.value)} />;
}

export default EditableTitle;
