type Props = {
    value: number | string;
    onChange: Function;
    disabled?: boolean;
}

function TopicCategory(props: Props) {    
    function onCategoryChange(event: React.ChangeEvent<HTMLSelectElement>) {
        if (!event.target.value) {
            return;
        }
        props.onChange({ target: { id: "category", value: event.target.value } });
    }

    return (<select id="category" className="form-select px-3" value={(Number(props.value)).toString()}
        onChange={onCategoryChange} disabled={props.disabled}>
        <option value="">Select...</option>
        <option value="0">Decision</option>
        <option value="1">Spent</option>
        <option value="2">Change Quota</option>
        <option value="3">Change Manager</option>
    </select>)
}

export default TopicCategory;