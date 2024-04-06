const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch(error => next(error))
    }

}

export { asyncHandler }



/* // higher order fuction which returns a function or accept function on his parameter
const asyncHandler = (func) => async (err, req, res, next) => {
    try {
        await func(err, req, res, next)
    }
    catch (error) {
        res.send(error.code || 500).json({
            status: false,
            message: error.message
        })
    }
}

*/