package cz.astro.var.data;

import cz.astro.var.data.czev.service.ServiceException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@ControllerAdvice
@Component
public class GlobalExceptionHandler {

    @ExceptionHandler(ServiceException.class)
    public void handleException(ServiceException e, HttpServletResponse response) throws IOException {
        response.sendError(HttpStatus.BAD_REQUEST.value(), e.getMessage());
    }

//    @ExceptionHandler
//    @ResponseBody
//    @ResponseStatus(HttpStatus.BAD_REQUEST)
//    public Map handle(MethodArgumentNotValidException exception) {
//        return error(exception.getBindingResult().getFieldErrors()
//                .stream()
//                .map(FieldError::getDefaultMessage)
//                .collect(Collectors.toList()));
//    }
//
//    @ExceptionHandler
//    @ResponseBody
//    @ResponseStatus(HttpStatus.BAD_REQUEST)
//    public Map handle(ConstraintViolationException exception) {
//        return error(exception.getConstraintViolations()
//                .stream()
//                .map(ConstraintViolation::getMessage)
//                .collect(Collectors.toList()));
//    }
//
//    @ExceptionHandler
//    @ResponseBody
//    @ResponseStatus(HttpStatus.BAD_REQUEST)
//    public Map handle(UnsatisfiedServletRequestParameterException exception) {
//        return error(exception.getMessage());
//    }
//
//    @ExceptionHandler
//    @ResponseBody
//    @ResponseStatus(HttpStatus.BAD_REQUEST)
//    public Map handle(ServiceException exception) {
//        return error(exception.getMessage());
//    }
//
//    @ExceptionHandler
//    @ResponseBody
//    @ResponseStatus(HttpStatus.BAD_REQUEST)
//    public Map handle(BindException exception) {
//        return error(exception.getFieldErrors()
//                .stream()
//                .map(fieldError -> "Failed to bind value '" + fieldError.getRejectedValue() + "' to field '" + fieldError.getField() + "'")
//                .collect(Collectors.toList())
//        );
//    }
//
//    private Map error(Object message) {
//        return Collections.singletonMap("error", message);
//    }
}
