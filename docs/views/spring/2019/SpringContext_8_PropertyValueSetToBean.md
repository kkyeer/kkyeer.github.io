# SpringContext(8)-PropertyValue到Bean内部属性：BeanWrapper对象的setPropertyValues方法

解析出的PropertyValue，通过BeanWrapperImpl的父类AbstractPropertyAccessor的setPropertyValues方法来集成到Bean的属性中，该方法遍历PropertyValues内部的List，对每一个PropertyValue，调用```setPropertyValue(PropertyValue pv)```方法

```java
    @Override
    public void setPropertyValue(PropertyValue pv) throws BeansException {
        PropertyTokenHolder tokens = (PropertyTokenHolder) pv.resolvedTokens;
        if (tokens == null) {
            String propertyName = pv.getName();
            AbstractNestablePropertyAccessor nestedPa;
            try {
                nestedPa = getPropertyAccessorForPropertyPath(propertyName);
            }
            catch (NotReadablePropertyException ex) {
                throw new NotWritablePropertyException(getRootClass(), this.nestedPath + propertyName,
                        "Nested property in path '" + propertyName + "' does not exist", ex);
            }
            tokens = getPropertyNameTokens(getFinalPath(nestedPa, propertyName));
            if (nestedPa == this) {
                pv.getOriginalPropertyValue().resolvedTokens = tokens;
            }
            nestedPa.setPropertyValue(tokens, pv);
        }
        else {
            setPropertyValue(tokens, pv);
        }
    }
```

1. 如果是非Tokenized的Property，则需要先按Property的Path来查找PropertyAccessor
2. 获取对应的property name tokens，如果PropertyAccessor没有嵌套，则将获取到的Tokens放入propertyValue的resolvedTokens属性
3. 如果没有Tokens则调用AbstractPropertyAccessor的```setPropertyValue(PropertyTokenHolder tokens, PropertyValue pv)```方法，否则调用获取的PropertyAccessor的相同的方法

## 1.1 按Property的Path来查找PropertyAccessor

```java
    protected AbstractNestablePropertyAccessor getPropertyAccessorForPropertyPath(String propertyPath) {
        int pos = PropertyAccessorUtils.getFirstNestedPropertySeparatorIndex(propertyPath);
        // Handle nested properties recursively.
        if (pos > -1) {
            String nestedProperty = propertyPath.substring(0, pos);
            String nestedPath = propertyPath.substring(pos + 1);
            AbstractNestablePropertyAccessor nestedPa = getNestedPropertyAccessor(nestedProperty);
            return nestedPa.getPropertyAccessorForPropertyPath(nestedPath);
        }
        else {
            return this;
        }
    }
```

1. 返回第一个property separator(字符"."，忽略map key(如"map\[a.b]"的情况)的位置，没有返回-1
2. 如果确实PropertyPath有嵌套(上一步返回非-1),继续递归查找
3. 如果确实PropertyPath没有嵌套，则返回当前的AbstractNestablePropertyAccessor

## 1.2 获取对应的property name tokens

返回一个PropertyTokenHolder对象，内部存储三个属性：以```”a[b][c]"```为例

- actualName：去掉所有key的值```"a"```
- canonicalName：```”a[b][c]"```
- keys：需要使用的toekn key，在示例中结果为```{"b","c"}```

## 1.3 AbstractPropertyAccessor的```setPropertyValue(PropertyTokenHolder tokens, PropertyValue pv)```方法

```java
    protected void setPropertyValue(PropertyTokenHolder tokens, PropertyValue pv) throws BeansException {
        if (tokens.keys != null) {
            processKeyedProperty(tokens, pv);
        }
        else {
            processLocalProperty(tokens, pv);
        }
    }
```

根据Property的property name tokens中是否有keys，调用processKeyedProperty或者processLocalProperty

### 1.3.1 PropertyName有key:processKeyedProperty方法

### 1.3.2 PropertyName没有key:processLocalProperty方法

```java
    private void processLocalProperty(PropertyTokenHolder tokens, PropertyValue pv) {
        PropertyHandler ph = getLocalPropertyHandler(tokens.actualName);
        if (ph == null || !ph.isWritable()) {
            if (pv.isOptional()) {
                return;
            }
            else {
                throw createNotWritablePropertyException(tokens.canonicalName);
            }
        }

        Object oldValue = null;
        try {
            Object originalValue = pv.getValue();
            Object valueToApply = originalValue;
            if (!Boolean.FALSE.equals(pv.conversionNecessary)) {
                if (pv.isConverted()) {
                    valueToApply = pv.getConvertedValue();
                }
                else {
                    if (isExtractOldValueForEditor() && ph.isReadable()) {
                        try {
                            oldValue = ph.getValue();
                        }
                        catch (Exception ex) {
                            if (ex instanceof PrivilegedActionException) {
                                ex = ((PrivilegedActionException) ex).getException();
                            }
                        }
                    }
                    valueToApply = convertForProperty(
                            tokens.canonicalName, oldValue, originalValue, ph.toTypeDescriptor());
                }
                pv.getOriginalPropertyValue().conversionNecessary = (valueToApply != originalValue);
            }
            ph.setValue(valueToApply);
        }
        catch (TypeMismatchException ex) {
            throw ex;
        }
        catch (InvocationTargetException ex) {
            PropertyChangeEvent propertyChangeEvent = new PropertyChangeEvent(
                    getRootInstance(), this.nestedPath + tokens.canonicalName, oldValue, pv.getValue());
            if (ex.getTargetException() instanceof ClassCastException) {
                throw new TypeMismatchException(propertyChangeEvent, ph.getPropertyType(), ex.getTargetException());
            }
            else {
                Throwable cause = ex.getTargetException();
                if (cause instanceof UndeclaredThrowableException) {
                    // May happen e.g. with Groovy-generated methods
                    cause = cause.getCause();
                }
                throw new MethodInvocationException(propertyChangeEvent, cause);
            }
        }
        catch (Exception ex) {
            PropertyChangeEvent pce = new PropertyChangeEvent(
                    getRootInstance(), this.nestedPath + tokens.canonicalName, oldValue, pv.getValue());
            throw new MethodInvocationException(pce, ex);
        }
    }
```

1. 获取BeanPropertyHandler，如果返回null，或者Property不可写，则根据isOptional来决定直接返回还是抛出异常
2. 判断是否需要convert，如果需要convert则将此属性缓存到pv的conversionNecessary属性中，同时，下面的set方法使用pv的convertedValue
3. 调用PropertyHandler的setValue(value)方法，将值set到Bean里

#### 1.3.2.1 获取BeanPropertyHandler

```java
    protected BeanPropertyHandler getLocalPropertyHandler(String propertyName) {
        PropertyDescriptor pd = getCachedIntrospectionResults().getPropertyDescriptor(propertyName);
        return (pd != null ? new BeanPropertyHandler(pd) : null);
    }
```

从BeanWrapperImpl实例的CachedIntrospectionResults中获取PropertyDescriptor，传入新的BeanPropertyHandler对象中返回此新对应，如果没有PropertyDescriptor，则返回null

#### 1.3.2.2 最终执行Set过程：PropertyHandler的setValue(value)方法

```java
    @Override
    public void setValue(final @Nullable Object value) throws Exception {
        final Method writeMethod = (this.pd instanceof GenericTypeAwarePropertyDescriptor ?
                ((GenericTypeAwarePropertyDescriptor) this.pd).getWriteMethodForActualAccess() :
                this.pd.getWriteMethod());
        if (System.getSecurityManager() != null) {
            AccessController.doPrivileged((PrivilegedAction<Object>) () -> {
                ReflectionUtils.makeAccessible(writeMethod);
                return null;
            });
            try {
                AccessController.doPrivileged((PrivilegedExceptionAction<Object>) () ->
                        writeMethod.invoke(getWrappedInstance(), value), acc);
            }
            catch (PrivilegedActionException ex) {
                throw ex.getException();
            }
        }
        else {
            ReflectionUtils.makeAccessible(writeMethod);
            writeMethod.invoke(getWrappedInstance(), value);
        }
    }
```

1. 获取pd的WriteMethod
2. 调用```writeMethod.invoke(getWrappedInstance(), value);```来set值到Bean中
