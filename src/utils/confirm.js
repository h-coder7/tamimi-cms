import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

export const confirmAction = ({
  title = "Confirm",
  message = "Are you sure you want to do this?",
  onConfirm,
  onCancel,
  confirmLabel = "Yes, Delete it!",
  cancelLabel = "Cancel"
}) => {
  confirmAlert({
    customUI: ({ onClose }) => {
      return (
        <div className="custom-ui-confirm py-5 px-4 bg-white rounded shadow-lg text-center col-lg-4 mx-auto radius-30" style={{}}>
          <div className="mb-3">
             <i className="fal fa-exclamation-triangle fa-3x text-warning"></i>
          </div>
          <h4 className="mb-2">{title}</h4>
          <p className="text-muted mb-4">{message}</p>
          <div className="d-flex justify-content-center gap-2">
            <button
              className="alert alert-secondary radius-10 py-2 px-3 fsz-14 ms-2 border-0 mb-0"
              onClick={() => {
                onCancel?.();
                onClose();
              }}
            >
              {cancelLabel}
            </button>
            <button
              className="alert alert-danger radius-10 py-2 px-3 fsz-14 ms-2 border-0 mb-0"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      );
    }
  });
};
