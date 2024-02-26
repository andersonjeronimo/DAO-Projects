type Props = {
    text: string;
    type: string;
    icon: string;
}

/**
 * 
 * @param props : text, type (success, warning, danger, etc...), icon (google material icon)
 * @returns Alert component
 */
function Alert(props: Props) {
    return (
        <div className={`alert alert-${props.type} alert-dismissible text-white fade show`} role="alert">
            <span className="alert-icon align-middle">
                <span className="material-icons md-24 me-2">{props.icon}</span>
            </span>
            <span className="alert-text"><strong>{props.text}</strong></span>
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    )
}

export default Alert;