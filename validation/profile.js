// imports
const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateProfileInput(data) {
  let errors = {};
  data.handle = !isEmpty(data.handle) ? data.handle : "";
  data.status = !isEmpty(data.status) ? data.status : "";
  data.skills = !isEmpty(data.skills) ? data.skills : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  if (!Validator.isLength(data.handle, {min:2 , max:40})) {
    errors.handle = "handle should be between 2 and 40 chars!";
  }
  if (Validator.isEmpty(data.handle)) {
    errors.handle = "Profile handle field is required!";
  }
  if (Validator.isEmpty(data.status)) {
    errors.status = "Status field is required!";
  }
  if (Validator.isEmpty(data.skills)) {
    errors.skills = "Skills field is required!";
  }

  if(!isEmpty(data.website)){
    if(!Validator.isURL(data.website)){
        errors.website = "Website is not valid!"
    }
}
if(!isEmpty(data.youtube)){
    if(!Validator.isURL(data.youtube)){
        errors.youtube = "Youtube is not valid!"
    }
}
if(!isEmpty(data.twitter)){
    if(!Validator.isURL(data.twitter)){
        errors.twitter = "Twitter is not valid!"
    }
}
if(!isEmpty(data.linkedin)){
    if(!Validator.isURL(data.linkedin)){
        errors.linkedin = "Linkedin is not valid!"
    }
}
if(!isEmpty(data.instagram)){
    if(!Validator.isURL(data.instagram)){
        errors.instagram = "Instagram is not valid!"
    }
}
if(!isEmpty(data.facebook)){
    if(!Validator.isURL(data.facebook)){
        errors.facebook = "Facebook is not valid!"
    }
}

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
