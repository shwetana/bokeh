#-----------------------------------------------------------------------------
# Copyright (c) 2012 - 2020, Anaconda, Inc., and Bokeh Contributors.
# All rights reserved.
#
# The full license is in the file LICENSE.txt, distributed with this software.
#-----------------------------------------------------------------------------

#-----------------------------------------------------------------------------
# Boilerplate
#-----------------------------------------------------------------------------
import pytest ; pytest

#-----------------------------------------------------------------------------
# Imports
#-----------------------------------------------------------------------------

# Bokeh imports
from bokeh._testing.util.api import verify_all

# Module under test
import bokeh.core.property.descriptor_factory as bcpdf # isort:skip

#-----------------------------------------------------------------------------
# Setup
#-----------------------------------------------------------------------------

ALL = (
    'PropertyDescriptorFactory',
)

#-----------------------------------------------------------------------------
# General API
#-----------------------------------------------------------------------------

#-----------------------------------------------------------------------------
# Dev API
#-----------------------------------------------------------------------------

class Child(bcpdf.PropertyDescriptorFactory):
    pass

def test_autocreate() -> None:
    obj = Child()
    value = obj.autocreate()
    assert isinstance(value, Child)

def test_make_descriptors_not_implemented() -> None:
    obj = bcpdf.PropertyDescriptorFactory()
    with pytest.raises(NotImplementedError):
        obj.make_descriptors("foo")

#-----------------------------------------------------------------------------
# Private API
#-----------------------------------------------------------------------------

#-----------------------------------------------------------------------------
# Code
#-----------------------------------------------------------------------------

Test___all__ = verify_all(bcpdf, ALL)
