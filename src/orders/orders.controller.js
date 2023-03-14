const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res, next) {
    res.json({ data: orders })
}

function bodyDataHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      
      
      //validate dishes property name
      if (propertyName === "dishes") {
        const dishes = data[propertyName];

        //validate dishes length > 0
        // if (typeof dishes !== "array") {
        //     return next({ status : 400, message: `Order must include at least one dish`})
        // } 
        //validate dishes length > 0
        if (dishes.length <= 0) {
            return next({ status : 400, message: `Order must include at least one dish`})
        } 
        //validate dishes length is !undefined
        if (dishes.length === undefined) {
            return next({ status : 400, message: `Order must include at least one dish`})
        } 
        // validate dishes quantity        
        dishes.forEach((dish, index) => {
            //console.log("dish quantity",typeof dish.quantity)
            if (typeof dish.quantity !== "number") {
                return next({
                    status: 400,
                    message: `Dish ${index} must have a quantity that is an integer greater than 0`
                })
            }
        })
      }
      //validate property name is truthy
      if (!data[propertyName]) {
        return next({ status: 400, message: `Must include a ${propertyName}` });
      }        
      //go to next middleware      
      next()
    };
  }

function create(req, res, next) {
    const { data: {deliverTo, mobileNumber, status, dishes} = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes,
    }
    orders.push(newOrder);
    res.status(201).json({ data: newOrder })
}

function validateOrder(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);

    if (foundOrder) {
        return next()
    }
    next({ 
        status: 404,
        message: `Order ID not found: ${orderId}`,
    })
}

function read(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    res.status(200).json({ data: foundOrder })
}

function update(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);

    const { data: {deliverTo, mobileNumber, status, dishes} = {} } = req.body;

    foundOrder.deliverTo = deliverTo;
    foundOrder.mobileNumber = mobileNumber;
    foundOrder.status = status;
    foundOrder.dishes = dishes;

    res.json({ data: foundOrder })
  }

  function destroy(req, res, next) {
    const { orderId } = req.params;
    const index = orders.findIndex((order, index) => order.id === orderId);
    const orderStatus = orders[index].status;
    if (orderStatus === "pending") {
        const deletedOrder = orders.splice(index, 1);
        res.sendStatus(204);
    }
    next({
        status: 400,
        message: `Unable to delete - order status pending`
    })
    
    
  }

module.exports = {
    list,
    create: [
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("status"),
        bodyDataHas("dishes"),
        create,
    ],
    read: [
        validateOrder,
        read,
    ],
    update: [
        validateOrder,
        bodyDataHas("deliverTo"),
        bodyDataHas("mobileNumber"),
        bodyDataHas("status"),
        bodyDataHas("dishes"),
        update,
    ],
    delete: [
        validateOrder,
        destroy,
    ]
}