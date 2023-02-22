const filesPayloadExists= (req, res, next)=>{
    if(!req.files) return res.status(200).json({status:'error', message: 'missing files'})
    next()
}
module.exports= filesPayloadExists