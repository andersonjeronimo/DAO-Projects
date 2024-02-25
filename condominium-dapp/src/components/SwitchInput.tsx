type Props = {
    id: string;
    text: string;
    isChecked: boolean;
    /* onChange: React.ChangeEventHandler<HTMLInputElement>; */
}

/**
 * 
 * @param props : id<text>, text, isChecked<boolean>, onChange<event>
 * @returns void
 */
function SwitchInput(props: Props) {
    
    function onSwitchChange(event: React.ChangeEvent<HTMLInputElement>) {
        const isChecked = event.target.value === "true";
        event.target.value = `${!isChecked}`;
        props.isChecked = !isChecked;
        /* props.onChange(event); */
    }

    function getIsChecked():boolean {
        return props.isChecked;
    }

    return (
        <div className="form-check form-switch d-flex align-itens-center mb-3">
            <input type="checkbox" className="form-check-input" id={props.id} checked={getIsChecked()} /* onChange={onSwitchChange} */ />
            <label htmlFor={props.id} className="form-check-label mb-0 ms-3">{props.text}</label>
        </div>
    )
}

export default SwitchInput;