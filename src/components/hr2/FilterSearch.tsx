const FilterSearch = ({ label, value, onOpenModal }: any) => {
    return (
        <div className="filter-search-group">
            <label>{label}</label>
            <div style={{ display: 'flex' }}>
                <input type="text" value={value || ""} readOnly placeholder="선택하세요" />
                <button type="button" onClick={onOpenModal}>🔍</button>
            </div>
        </div>
    );
};

export default FilterSearch;