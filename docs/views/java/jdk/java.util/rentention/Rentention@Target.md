---
date: 2019-05-14
categories:
  - Java
tags:
  - 注解
publish: true
---


# JavaSE进阶-注解：元注解@Target

## 注解中的@Target

@Target的可能取值为以下枚举类中值的组合，指征当前的注解类可以在哪些位置使用
```Java
public enum ElementType {
    /** Class, interface (including annotation type), or enum declaration */
    TYPE,

    /** Field declaration (includes enum constants) */
    FIELD,

    /** Method declaration */
    METHOD,

    /** Formal parameter declaration */
    PARAMETER,

    /** Constructor declaration */
    CONSTRUCTOR,

    /** Local variable declaration */
    LOCAL_VARIABLE,

    /** Annotation type declaration */
    ANNOTATION_TYPE,

    /** Package declaration */
    PACKAGE,

    /**
     * Type parameter declaration
     *
     * @since 1.8
     */
    TYPE_PARAMETER,

    /**
     * Use of a type
     *
     * @since 1.8
     */
    TYPE_USE
}
```
### 默认值
当一个注解没有指定@Target时，默认可以在除了TYPE_PARAMETER以外的任何上下文使用
### 分类
从类型上区分，上面10个枚举值可以分为两种，前八种出现在声明上下文中，后两种出现在类型上下文中
### 声明上下文注解
1. 声明上下文注解包括八种，从外到内分别是包声明，类声明，Field声明，构造器声明，方法声明，参数声明，注解声明，本地变量声明
2. 类声明，Field声明，构造器声明，方法声明，参数声明比较常用，注解的值的获取都是通过Class对象的反射来获取，需要特别注意的是，**当一个变量是私有变量时，通过Field反射获取前需要setAccesible(true)**
3. 包注解，通过package-info.java类定义，通过Package类反射获取值
```Java
 	Package pkg = Package.getPackage("taste.annotaions.targetdemo");
        System.out.println("PACKAGE:" + pkg.getAnnotation(PackageAnnotation.class).value());
```
4. 声明类注解的使用如下代码所示
```Java
/**
 * @Author: kkyeer
 * @Description: 注解不同Target的使用与值的获取
 * @Date:Created in 22:07 2019/3/21
 * @Modified By:
 */

// 类注解
@VariousTarget.TypeAnnotation("This is before class declaration")
public class VariousTarget {
    // 构造器注解，内部是注解的注解
    @ConstructorAnnotation(value="This is a constructor annotation",ref=@AnnotationTypeAnnotation("This is a annotation of a annotation"))
    public VariousTarget(){}

    // 成员变量注解
    @FieldAnnotation("This is a field annotation")
    private String prop;

    // 方法注解，参数列表中是参数注解
    @MethodAnnotation("This is a method annotation")
    private void printSomething(@ParameterAnnotation("parameter annotation") String content) {
        // 本地变量注解，仅在源码中有效，不会被编译到class文件中
        @LocalVariableAnnotation("This ia a local variable annotation")
        String prefix = "-------";
    }


    public static void main(String[] args) throws NoSuchMethodException, NoSuchFieldException {
        Class<VariousTarget> clazz = VariousTarget.class;
        System.out.println("TYPE:" + clazz.getAnnotation(TypeAnnotation.class).value());

        Constructor<VariousTarget> constructor = clazz.getConstructor();
        ConstructorAnnotation constructorAnnotation = constructor.getAnnotation(ConstructorAnnotation.class);
        System.out.println("CONSTRUCTOR:" + constructorAnnotation.value());
        System.out.println("ANNOTATION TYPE:"+constructorAnnotation.ref().value());
        Field field = clazz.getDeclaredField("prop");
        // 此处需要更改访问权限来获取注解值
        field.setAccessible(true);
        System.out.println("FIELD:" + field.getAnnotation(FieldAnnotation.class).value());

        Method method = clazz.getDeclaredMethod("printSomething", String.class);
        System.out.println("METHOD:" + method.getAnnotation(MethodAnnotation.class).value());
        Annotation[][] parameterAnnos = method.getParameterAnnotations();
        System.out.println("PARAMETER:" + ((ParameterAnnotation) parameterAnnos[0][0]).value());

        Package pkg = Package.getPackage("taste.annotaions.targetdemo");
        System.out.println("PACKAGE:" + pkg.getAnnotation(PackageAnnotation.class).value());
    }

    /**
     * Target为TYPE的注解
     */
    @Target(ElementType.TYPE)
    @Retention(RetentionPolicy.RUNTIME)
    public @interface TypeAnnotation {
        String value();
    }

    /**
     * Target为Constructor的注解
     */
    @Target(ElementType.CONSTRUCTOR)
    @Retention(RetentionPolicy.RUNTIME)
    public @interface  ConstructorAnnotation{
        String value();
        AnnotationTypeAnnotation ref();
    }

    /**
     * Target为Field的注解
     */
    @Target(ElementType.FIELD)
    @Retention(RetentionPolicy.RUNTIME)
    public @interface  FieldAnnotation{
        String value();
    }

    /**
     * Target为Method的注解
     */
    @Target(ElementType.METHOD)
    @Retention(RetentionPolicy.RUNTIME)
    public @interface  MethodAnnotation{
        String value();
    }

    /**
     * Target为Parameter的注解
     */
    @Target(ElementType.PARAMETER)
    @Retention(RetentionPolicy.RUNTIME)
    public @interface  ParameterAnnotation{
        String value();
    }

    /**
     * Target为AnnotationType的注解，也就是给注解作注解的注解
     */
    @Target(ElementType.ANNOTATION_TYPE)
    @Retention(RetentionPolicy.RUNTIME)
    public @interface  AnnotationTypeAnnotation{
        String value();
    }

    /**
     * Target为Parameter的注解
     */
    @Target(ElementType.LOCAL_VARIABLE)
    @Retention(RetentionPolicy.SOURCE)
    public @interface  LocalVariableAnnotation{
        String value();
    }


    /**
     * Target为Parameter的注解
     */
    @Target(ElementType.PACKAGE)
    @Retention(RetentionPolicy.RUNTIME)
    public @interface  PackageAnnotation{
        String value();
    }
}
```

## 类型上下文注解

### 注解定义
```Java
@Target(ElementType.TYPE_USE)
@Retention(RetentionPolicy.RUNTIME)
public @interface TypeUseAnnotation {
    String value();
}
```

当一个注解的Target被指定为TYPE_USE时，这个注解的使用位置为类型参数的位置，具体参考JLS4.11，基本上可以理解为，几乎所有类型定义的位置都可以使用，试举几例如下

#### 注解返回值和异常
```Java
 public @TypeUseAnnotation("Return type") String trapOperation(List<String> param) throws @TypeUseAnnotation("Exception annotation") Exception{
        if (param != null) {
            throw new Exception("You are trapped");
        }

        return null;
}
```
获取上述注解的值
```Java
Method method = clazz.getMethod("trapOperation", List.class);
// 异常列表中的注解
System.out.println(method.getAnnotatedExceptionTypes()[0].getAnnotation(TypeUseAnnotation.class).value());

// 返回值中的注解        System.out.println(method.getAnnotatedReturnType().getAnnotation(TypeUseAnnotation.class).value());
```
