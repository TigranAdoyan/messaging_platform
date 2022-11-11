module.exports = function(connection) {
    this.find = async (props) => {
        return connection
            .select('*')
            .from('users')
            .where(props.where);
    }
};