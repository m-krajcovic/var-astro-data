package cz.astro.var.data;

import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.ControllerAdvice;

@ControllerAdvice
@Component
public class GlobalExceptionHandler {
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
