const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function bodyDataHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName]) {
        return next();
      }
      next({ status: 400, message: `Must include a ${propertyName}` });
    };
  }
  
  function validateDish(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === Number(dishId))
    
    if (foundDish) {
      return next();
    }
    next({
      status: 404,
      message: `Dish ID not found: ${dishId}`
    })
  }
  
  function list(req, res, next) {
    res.json({data: dishes})
  }
  
  function create(req, res, next) {
    const { data: {name, description, price, image_url} = {} } = req.body;
    const newDish = {
      id: nextId(),
      name,
      description,
      price,
      image_url,
    }
    dishes.push(newDish);
    res.status(201).json({data: newDish})
  }
  
  function read(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === Number(dishId))
    
    res.json({data: foundDish});
  }
  
  module.exports = {
    list,
    create: [
      bodyDataHas("name"),
      bodyDataHas("description"),
      bodyDataHas("price"),
      bodyDataHas("image_url"),
      create,],
    read: [
      validateDish,
      read,]
  }