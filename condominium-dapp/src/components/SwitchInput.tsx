type Props = {
    id: string;
    text: string;
    isChecked: boolean;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
}

/**
 * 
 * @param props : id(text), text, isChecked(boolean), onChange(React.ChangeEventHandler[HTMLInputElement])
 * @returns void
 */
function SwitchInput(props: Props) {
    
    function onSwitchChange(event: React.ChangeEvent<HTMLInputElement>) {
        const isChecked = event.target.value === "true";
        event.target.value = `${!isChecked}`;        
        props.onChange(event);
    }

    function getIsChecked():boolean {
        if (typeof props.isChecked === "string") {
            return props.isChecked === "true";
        }
        return props.isChecked;
    }

    return (
        <div className="form-check form-switch d-flex align-itens-center mb-3">
            <input className="form-check-input" type="checkbox" id={props.id} checked={getIsChecked() || false} onChange={onSwitchChange} />
            <label className="form-check-label htmlFor={props.id} mb-0 ms-3">{props.text}</label>
        </div>
    )
}

export default SwitchInput;