//"Nameless Chamber" - a music dictation web application.
//"Copyright 2020 Massachusetts Institute of Technology"

//This file is part of "Nameless Chamber"
    
//"Nameless Chamber" is free software: you can redistribute it and/or modify
//it under the terms of the GNU Affero General Public License as published by //the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.

//"Nameless Chamber" is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//GNU Affero General Public License for more details.

//You should have received a copy of the GNU Affero General Public License
//along with "Nameless Chamber".  If not, see	<https://www.gnu.org/licenses/>.

//Contact Information: garo@mit.edu 
//Source Code: https://github.com/NamelessChamber/NamelessChamber





/* eslint no-console:0 */
// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
//
// To reference this file, add <%= javascript_pack_tag 'application' %> to the appropriate
// layout file, like app/views/layouts/application.html.erb

// csrf
const token = $('meta[name="csrf-token"]').attr('content');
$.ajaxSetup({
  beforeSend: (xhr) => {
    xhr.setRequestHeader('X-CSRF-Token', token);
  }
});
