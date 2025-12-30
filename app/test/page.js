// issue:
// - useEffect has a dependency that it is trying to update, thus infinite renders
// - this component is a bit anti-pattern as it creates two sources of truths for title,
//   one that is passed from parent and one that it itself updates; better is to keep
//   the title inside the parent and pass its updater function to the child. However,
//   if we want the edit to reset on prop change, the prop + state synching is justified

function EditableTitle({ title, setTitle }) {
  return <input value={title} onChange={e => setTitle(e.target.value)} />;
}

export default EditableTitle;
