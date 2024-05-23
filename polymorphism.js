//定义模型
const Post = sequelize.define('Post',{/*模型属性*/});
const Video = sequelize.define('Video',{/*模型属性*/});

const Comment = sequelize.define('comment',{
    commentableID:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    commentableType: {
        type: Sequelize.STRING,
        allowNull:false
    }
});

//创建多态关联
Comment.belongsTo(Post,{
    foreignKey: 'commentableID',
    constraints: false,
    scope: {
        commentableType: 'post'
    }
});

Comment.belongsTo(Video,{
    foreignKey: 'commentableID',
    constraints:false,
    scope: {
        commentableType: 'video'
    }
});

Post.hasMany(Comment,{
    foreignKey: 'commentableID',
    constraints:false,
    as: 'comments'
});

Video.hasMany(Comment,{
    foreignKey: 'commentableID',
    constraints:false,
    as:'comments'
});